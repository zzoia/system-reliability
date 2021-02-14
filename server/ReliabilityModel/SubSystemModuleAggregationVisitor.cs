using ReliabilityModel.Model.System;
using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model
{
    public class SubSystemModuleAggregationVisitor
    {
        public IReadOnlyList<SingleModuleSystem> VisitSubSystem(System.System system)
        {
            var allSingleModules = new List<SingleModuleSystem>();

            AggregateModules(allSingleModules, system);

            return allSingleModules;
        }

        private static void AggregateModules(List<SingleModuleSystem> allSingleModules, System.System system)
        {
            switch (system)
            {
                case MultipleModuleSystem multipleModuleSubSystem:
                {
                    var singleModules = multipleModuleSubSystem.SubSystems.OfType<SingleModuleSystem>();
                    allSingleModules.AddRange(singleModules);

                    var multipleModuleSubSystems =
                        multipleModuleSubSystem.SubSystems.OfType<MultipleModuleSystem>();

                    foreach (var moduleSubSystem in multipleModuleSubSystems)
                    {
                        AggregateModules(allSingleModules, moduleSubSystem);
                    }

                    break;
                }
                case SingleModuleSystem singleModule:
                    allSingleModules.Add(singleModule);
                    break;
            }
        }
    }
}