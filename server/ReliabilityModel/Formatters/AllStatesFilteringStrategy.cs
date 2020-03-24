using ReliabilityModel.Model;

namespace ReliabilityModel.Model.Formatters
{
    public class AllStatesFilteringStrategy : StateFilteringStrategy
    {
        public override bool IncludeState(SystemState systemState) => true;
    }
}