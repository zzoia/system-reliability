using ReliabilityModel.Model;

namespace ReliabilityModel.Model.Formatters
{
    public abstract class StateFilteringStrategy
    {
        public abstract bool IncludeState(SystemState systemState);
    }
}